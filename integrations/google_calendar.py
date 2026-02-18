import datetime
import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger("CampusCompanion")

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar.events']

class GoogleCalendarClient:
    def __init__(self):
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        self.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/integrations/google/callback")

    def get_auth_url(self, student_id: str):
        """Generate Authorization URL for student"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=SCOPES,
            redirect_uri=self.redirect_uri
        )
        auth_url, _ = flow.authorization_url(prompt='consent', access_type='offline', state=student_id)
        return auth_url

    def fetch_token(self, code: str):
        """Exchange authorization code for tokens"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=SCOPES,
            redirect_uri=self.redirect_uri
        )
        flow.fetch_token(code=code)
        credentials = flow.credentials
        return {
            "token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "expiry": credentials.expiry.isoformat() if credentials.expiry else None
        }

    def create_event(self, credentials_dict: dict, event_data: dict):
        """Create an event in the student's primary calendar"""
        try:
            creds = Credentials(
                token=credentials_dict.get("token"),
                refresh_token=credentials_dict.get("refresh_token"),
                token_uri="https://oauth2.googleapis.com/token",
                client_id=self.client_id,
                client_secret=self.client_secret,
                scopes=SCOPES
            )
            service = build('calendar', 'v3', credentials=creds)

            event = {
                'summary': event_data.get('title'),
                'location': event_data.get('location', 'TCET Mumbai'),
                'description': event_data.get('description', ''),
                'start': {
                    'dateTime': event_data.get('start_time'),
                    'timeZone': 'Asia/Kolkata',
                },
                'end': {
                    'dateTime': event_data.get('end_time'),
                    'timeZone': 'Asia/Kolkata',
                },
                'reminders': {
                    'useDefault': True,
                },
            }

            event = service.events().insert(calendarId='primary', body=event).execute()
            logger.info(f"📅 Event created: {event.get('htmlLink')}")
            return event.get('id')

        except HttpError as error:
            logger.error(f"❌ Google Calendar API Error: {error}")
            return None

# Singleton instance
calendar_instance = GoogleCalendarClient()
