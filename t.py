import asyncio
from aiohttp import web
TRY_AND_MODIFY = True
# Define the callback function to process the data
async def process_callback(data):
    print(f"Processing data: {data}")
    await asyncio.sleep(2)
    print(f"Finished processing data: {data}")
    globals()['TRY_AND_MODIFY'] = False

# Define the handler for incoming POST requests
async def handle_post(request):
    data = await request.json()  # Get JSON data from the request
    asyncio.create_task(process_callback(data))  # Process data in a non-blocking manner
    return web.Response(text="Request received and processing started")

# Create and run the web application
app = web.Application()
app.router.add_post('/process', handle_post)

async def background_task():
    while True:
        print("Hello", TRY_AND_MODIFY)
        await asyncio.sleep(1)  # Use asyncio.sleep for non-blocking sleep

async def main():
    # Run both the web server and the background task concurrently
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', 8080)
    await site.start()

    # Start the background task
    await background_task()

if __name__ == '__main__':
    asyncio.run(main())
