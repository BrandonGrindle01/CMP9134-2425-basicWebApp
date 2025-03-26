FROM  mcr.microsoft.com/devcontainers/python:3.10

WORKDIR /workspace
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN pip install flask
RUN pip install requests
COPY . .

CMD ["python", "main.py"]