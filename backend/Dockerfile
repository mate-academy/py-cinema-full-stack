FROM --platform=linux/amd64 python:3.13-slim
LABEL maintainer="danylo.t@mate.academy"

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN pip install --upgrade pip
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY ./backend .

RUN mkdir -p /vol/web/media /vol/web/static && \
    adduser --disabled-password --no-create-home django-user

RUN chown -R django-user:django-user /app /vol/ && \
    chmod -R 755 /app /vol/web/ && \
    find /app -type f -exec chmod 644 {} +

USER django-user
