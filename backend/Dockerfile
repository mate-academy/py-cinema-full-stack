FROM python:3-slim-buster
LABEL maintainer="ksyusha0kubay@gmail.com"

ENV PYTHONUNBUFFERED 1

WORKDIR app/

COPY ../requirements.txt /app/requirements.txt

RUN apt-get update \
    && apt-get -y install libpq-dev gcc

RUN pip install -r requirements.txt

COPY . .

RUN mkdir -p /vol/web/media

RUN adduser \
        --disabled-password \
        --no-create-home \
        django-user

RUN chown -R django-user:django-user /vol/
RUN chmod -R 755 /vol/web/

USER django-user

#FROM python:3-slim-buster
#LABEL maintainer="ksyusha0kubay@gmail.com"
#
#WORKDIR /app
#
#
#ENV PYTHONDONTWRITEBYTECODE 1
#ENV PYTHONUNBUFFERED 1
#
#
#RUN pip install --upgrade pip
#COPY ../requirements.txt /app/requirements.txt
#RUN pip install -r requirements.txt
#
#
#COPY . .
#
#RUN mkdir -p /vol/web/media
#
#RUN adduser \
#    --disabled-password \
#    --no-create-home \
#    django-user
#
#RUN chown -R django-user:django-user /vol/
#RUN chmod -R 755 /vol/web/
#
#USER django-user
