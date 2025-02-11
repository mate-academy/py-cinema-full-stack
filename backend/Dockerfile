FROM --platform=linux/amd64 python:3.13-slim
LABEL maintainer="danylo.t@mate.academy"

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN pip install --upgrade pip
COPY requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

COPY . .

RUN mkdir -p /app/vol/web/media
RUN adduser --disabled-password --no-create-home django-user
RUN chown -R django-user:django-user /app/vol/web/media
RUN chmod -R 775 /app/vol/web/media

USER django-user
