FROM --platform=linux/amd64 python:3.10.9-slim-buster
LABEL maintainer="danylo.t@mate.academy"

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Upgrade pip and install requirements
RUN pip install --upgrade pip
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Copy the application code
COPY . .

# Create necessary directories
RUN mkdir -p /vol/web/media/uploads/

RUN adduser \
    --disabled-password \
    --no-create-home \
    --gecos '' \
    django-user

RUN mkdir -p /vol/web/media/uploads/
RUN chown -R django-user:django-user /vol/
RUN chown -R django-user:django-user /vol/web/media/uploads/
RUN chmod -R 775 /vol/web/media/uploads/
RUN chmod -R 755 /vol/web/


USER django-user