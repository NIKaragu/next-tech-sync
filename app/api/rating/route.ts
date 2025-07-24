import { NextApiRequest } from "next";

export async function GET() {
  console.warn("Incoming GET request");
  const ratingData = await fetch("http://localhost:3001/rating", {
    method: "GET",
  });
  console.log(ratingData.status, ratingData.statusText);

  if (!ratingData.ok) {
    console.error("Failed to fetch rating data:", ratingData.statusText);
    return new Response("Failed to fetch rating data", {
      status: ratingData.status,
    });
  }

  return new Response(ratingData.body);
}

export async function POST(request: NextApiRequest) {
  console.warn("Incoming POST request");
  try {
    const body: { name: string; time: string | number } = request.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return new Response("Invalid data format", { status: 400 });
    }

    if (!body.name) {
      return new Response("Missed name field", { status: 400 });
    } else if (!body.time) {
      return new Response("Missed time field", { status: 400 });
    }

    const parsedTime =
      typeof body.time === "string" ? Number.parseFloat(body.time) : body.time;

    if (Number.isNaN(parsedTime)) {
      return new Response("Invalid time format", { status: 400 });
    }

    body.time = parsedTime.toFixed(2);

    const ratingData = await fetch("http://localhost:3001/rating", {
      method: "GET",
    });
    console.log(ratingData.status, ratingData.statusText);

    if (!ratingData.ok) {
      console.error("Failed to fetch rating data:", ratingData.statusText);
      return new Response("Failed to fetch rating data", {
        status: ratingData.status,
      });
    }

    const existingRatings: {
      name: string;
      time: string | number;
      rank: number;
    }[] = await ratingData.json();
    const newPlayer = { name: body.name, time: body.time };

    const updatedRatings = [...existingRatings, { ...newPlayer, rank: 0 }];

    updatedRatings.sort((a, b) => Number(a.time) - Number(b.time));

    updatedRatings.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    const newRank = updatedRatings.find((p) => p.name === newPlayer.name)?.rank;

    try {
      await fetch(`http://localhost:3001/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...body, rank: newRank}),
      });
    } catch (error) {
      console.error("Error sending data to /rating:", error);
      return new Response("Failed to send data to /rating", { status: 500 });
    }

    return new Response(
      JSON.stringify({ status: "Data received and saved", data: {...body, rank: newRank} }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
