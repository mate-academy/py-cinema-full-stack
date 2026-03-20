FROM --platform=linux/amd64 python:3.13-slim
LABEL maintainer="danylo.t@mate.academy"

# Робоча директорія
WORKDIR /app

# Оптимальні ENV
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Оновлення pip та встановлення залежностей
RUN pip install --upgrade pip
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Копіювання всього коду
COPY . .

# Директорії для медіа
RUN mkdir -p /vol/web/media

# Створення користувача без root
RUN adduser \
    --disabled-password \
    --no-create-home \
    django-user

# Права доступу
RUN chown -R django-user:django-user /vol/
RUN chmod -R 755 /vol/web/

# Відкриття порту (узгоджено з docker-compose.yml)
EXPOSE 8000

# Запуск від користувача
USER django-user
