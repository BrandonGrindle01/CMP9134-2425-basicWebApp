#install all required dependencies and images. define joint workspace.
FROM  mcr.microsoft.com/devcontainers/python:3.10

WORKDIR /workspace
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN pip install flask
RUN pip install requests
RUN pip install python-dotenv
COPY . .

CMD ["python", "main.py"]