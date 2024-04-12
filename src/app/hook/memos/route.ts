export async function POST(request: Request) {
  const data = await request.json();
  console.log("POST", data);

  return new Response(null, { status: 200 });
}
