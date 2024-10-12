
from pydantic import BaseModel, HttpUrl

# Model for the URLTest
class URLTest(BaseModel):
    url: HttpUrl
