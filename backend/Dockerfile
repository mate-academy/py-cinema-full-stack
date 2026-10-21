FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt && \
    adduser --disabled-password --gecos '' --uid 10001 cinema && \
    mkdir -p /vol/web/media && chown -R cinema:cinema /vol/web
COPY backend/ /app/
USER cinema
EXPOSE 8080
CMD ["sh", "-c", "python manage.py wait_for_db && python manage.py migrate && python manage.py runserver 0.0.0.0:8080 --noreload"]
