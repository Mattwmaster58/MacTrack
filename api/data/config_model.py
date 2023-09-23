from pydantic import BaseModel


class SMTPOptions(BaseModel):
    smtp_username: str
    smtp_password: str
    smtp_server: str
    smtp_port: int


class Config(BaseModel):
    email: SMTPOptions
