// Next.js API Route example
export async function POST(req) {
    try {
        const body = await req.json();

        // Forward to Django
        const response = await fetch('http://localhost:8000/api/v1/hire/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return Response.json(data);
    } catch (error) {
        console.error('Error in Contact API proxy:', error);
        return Response.json({ error: 'Failed to connect to backend' }, { status: 500 });
    }
}
