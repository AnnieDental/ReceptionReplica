import json
import os
import fastapi
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI, OpenAI
import uvicorn
import logging
from dotenv import load_dotenv
from typing import List, Optional
import requests
from pydantic import BaseModel
from typing import List


class PromptBlockStep(BaseModel):
    title: str
    description: str
    instructions: str
    examples: str


class PromptBlock(BaseModel):
    title: str
    description: str
    usage: str
    usageContext: str
    promptBlockSteps: List[PromptBlockStep]


TEST_TRANSCRIPT = """<transcript>
    <patient>Hi there, I’d like to schedule dental cleanings for both of my kids.</patient>
    <office>Hello, Sarah! We’d be happy to help. Could you please provide your phone number?</office>
    <patient>Of course. My number is 312-555-0198.</patient>
    <office>Great, thank you. And just to confirm, your full name is Sarah Carter, correct?</office>
    <patient>Yes, that’s right.</patient>
    <office>Perfect. Now, could you let us know which days and times work best for you?</office>
    <patient>I was hoping to get one appointment next Tuesday in the morning around 10:00 AM and the other one on Wednesday afternoon at 2:30 PM.</patient>
    <office>Let me check our schedule… Yes, we have an opening at 10:00 AM on Tuesday and a 2:30 PM slot on Wednesday. Does that work for your schedule?</office>
    <patient>That works perfectly for us.</patient>
    <office>Excellent! I’ve scheduled a cleaning for your first child on Tuesday at 10:00 AM and for your second child on Wednesday at 2:30 PM. Is there anything else you need?</office>
    <patient>No, that’s all. Thank you for your help!</patient>
    <office>You’re welcome, Sarah. We look forward to seeing you and your kids soon. Have a great day!</office>
    <patient>Thanks, you too!</patient>
</transcript>"""

EXTRACT_FLOW_SYSTEM_PROMPT = """You are an AI assistant specialized in analyzing call transcripts and extracting structured workflows based on how an office handles the call. Your task is to infer a detailed, step-by-step workflow from the transcript provided. Focus only on the actions and interactions of the office (i.e. the parts where the office representative speaks), and ignore the patient’s responses except as context for understanding the office’s steps.

Your output must be a JSON object with the following structure:
	•	title: A brief title for the workflow.
	•	description: A summary description of the workflow extracted from the transcript.
	•	usage: General usage guidelines or notes about how the workflow should be interpreted.
	•	usageContext: A brief note on when this workflow is applicable.
	•	promptBlockSteps: An ordered array of step objects. Each step object should include:
	•	title: The name or label of the step.
	•	description: A concise description of what the step entails.
	•	instructions: Detailed instructions or actions that the office took in this step.
	•	examples: One or more examples (or key phrases from the transcript) that illustrate the step.

Follow these guidelines when generating the workflow:
	•	Identify and sequence the office’s actions: For example, greeting the patient, asking for the phone number, confirming patient details, checking appointment availability, scheduling appointments, and closing the call.
	•	Ensure clarity and order: Each step should clearly reflect the office’s process as it appears in the transcript.
	•	Output format compliance: Your response should strictly follow the JSON structure outlined above.
	•	Exclude any extraneous commentary: Only output the JSON structure without any additional text or explanation.

Your task is to extract and organize the workflow steps as they are demonstrated by the office in the transcript provided."""



# Load environment variables from .env file
load_dotenv()
ELEVEN_LABS_HEADERS = {"xi-api-key": os.getenv("ELEVEN_LABS_API_KEY")}

# Retrieve API key from environment
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

app = fastapi.FastAPI()

# Enable CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust allowed origins as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


oai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
client = OpenAI(api_key=OPENAI_API_KEY)

class Message(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    messages: List[Message]
    model: str
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = None
    stream: Optional[bool] = False
    user_id: Optional[str] = None

SYSTEM_PROMPT = """You are an individual calling Good Smiles Dental adopt the following persona. You are tasked with adopting a PERSONA and conversing with Good Smiles Dental, a dental office. Act as if this is your natural identity during the call.

<PERSONA>
Parent Calling for Child's Appointment
Name: Sarah Carter
Date Of Birth: 1984-01-01
Scenario: Sarah just moved into her new apartment and wants to schedule dental cleaning appointments for her son and daughter.
Phone: 3852224367
Email: sarah@carter.com
Insurance Name: Select Health
Insurance Policy Holder Name: Sarah Carter
Insurance Policy Number: D123456789
Insurance Policy Group Number: GRP987654

## Son
- Name: Ethan Carter, 16 years old (as of 2024)
- Age: 16 years old (as of 2024)
- Education: Freshman at Green Valley High School
- Interests: Basketball, video games, and robotics club
- Marital Status: Single

## Daughter
- Name: Lily Carter, 13 years old (as of 2024)
- Age: 13 years old (as of 2024)
- Education: Eighth grade at Green Valley Middle School
- Interests: Ballet, volunteering at the local animal shelter, and participating in the school debate team
- Marital Status: Single
</PERSONA>

<additional_instructions>
If a user responds with '...' it means that they didn't respond or say anything, you should prompt them to speak, or if they don't respond for a while then ask if they're still there. Since your answers will be converted to audio, make sure to not use symbols like dollar, percent, hashtag, at, etc. or digits in your responses; if you need to use them write them out as words e.g. "three dollars", "hashtag", "one", "two", etc. Do not format your text response with bullet points, bold or headers. You may also be supplied with an additional documentation knowledge base which may contain information that will help you to answer questions from the user.
</additional_instructions>
"""

@app.post("/chat/completions")
async def create_chat_completion(request: ChatCompletionRequest) -> StreamingResponse:
    oai_request = request.dict(exclude_none=True)
    if "user_id" in oai_request:
        oai_request["user"] = oai_request.pop("user_id")

    # overwrite the system prompt
    oai_request["messages"] = [{"role": "system", "content": SYSTEM_PROMPT}] + oai_request["messages"][1:]

    print(oai_request)
    print(oai_request["messages"])

    chat_completion_coroutine = await oai_client.chat.completions.create(**oai_request)

    async def event_stream():
        try:
            async for chunk in chat_completion_coroutine:
                # Convert the ChatCompletionChunk to a dictionary before JSON serialization
                chunk_dict = chunk.model_dump()
                yield f"data: {json.dumps(chunk_dict)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logging.error("An error occurred: %s", str(e))
            yield f"data: {json.dumps({'error': 'Internal error occurred!'})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")



class Flow(BaseModel):
    name: str
    description: str
    steps: List[dict]

@app.get("/flows/{conversation_id}")
def log_conversation_id(conversation_id: str):
    url = f"https://api.us.elevenlabs.io/v1/convai/conversations/{conversation_id}"

    response = requests.get(url, headers=ELEVEN_LABS_HEADERS)


    remapped_messages = [{'role': 'patient' if entry['role'] == 'agent' else 'office', 'message': entry['message']} for
                         entry in response.json()['transcript']]
    transcript_xml = "<transcript>" + "".join(
        [f"<{entry['role']}>{entry['message']}</{entry['role']}>" for entry in remapped_messages]) + "</transcript>"

    completion = client.beta.chat.completions.parse(
        messages=[
            {
                "role": "system",
                "content": EXTRACT_FLOW_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": transcript_xml,
            }
        ],
        model="o4-mini",
        reasoning_effort="low",
        response_format=PromptBlock
    )

    prompt_block = completion.choices[0].message.parsed

    print(prompt_block)

    return prompt_block


@app.get("/test")
def test():
    completion = client.beta.chat.completions.parse(
        messages=[
            {
                "role": "system",
                "content": EXTRACT_FLOW_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": TEST_TRANSCRIPT,
            }
        ],
        model="o4-mini",
        reasoning_effort="low",
        response_format=PromptBlock
    )

    prompt_block = completion.choices[0].message.parsed
    print(prompt_block)
    return prompt_block
