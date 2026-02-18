import csv
import json
import os
import requests
from typing import List, Dict, Optional
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger("CampusCompanion")

class ERPSync:
    def __init__(self):
        self.api_url = os.getenv("ERP_API_URL", "https://erp.tcet.edu/api")
        self.api_key = os.getenv("ERP_API_KEY")
        self.fallback_file = "data/erp_fallback.csv"

    def fetch_student_data(self, student_id: str) -> Optional[Dict]:
        """
        Fetch official student record from ERP.
        Tries API first, falls back to local CSV.
        """
        if self.api_key:
            try:
                response = requests.get(
                    f"{self.api_url}/students/{student_id}",
                    headers={"X-API-KEY": self.api_key},
                    timeout=5
                )
                if response.status_code == 200:
                    logger.info(f"✅ ERP Data fetched for {student_id}")
                    return response.json()
            except Exception as e:
                logger.warning(f"⚠️ ERP API Connection failed: {e}. Falling back to CSV.")

        return self._fetch_from_csv(student_id)

    def _fetch_from_csv(self, student_id: str) -> Optional[Dict]:
        """Read fallback data from local CSV"""
        if not os.path.exists(self.fallback_file):
            # Create a mock dummy file if not exists
            self._create_mock_csv()

        try:
            with open(self.fallback_file, mode='r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row['student_id'] == student_id:
                        logger.info(f"📁 Local ERP Data found for {student_id}")
                        return row
        except Exception as e:
            logger.error(f"❌ Fallback Sync Error: {e}")
        
        return None

    def _create_mock_csv(self):
        """Generate a sample ERP database"""
        os.makedirs("data", exist_ok=True)
        headers = ['student_id', 'full_name', 'department', 'admission_category', 'fee_status', 'hostel_requirement']
        data = [
            ['demo_student', 'Soham Satish Sawant', 'IT', 'General', 'Pending', 'Yes'],
            ['CS101', 'Alice Johnson', 'CS', 'Institutional', 'Paid', 'No'],
            ['ME202', 'Bob Smith', 'ME', 'Minority', 'Pending', 'Yes'],
        ]
        with open(self.fallback_file, mode='w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(data)

# Singleton instance
erp_instance = ERPSync()
