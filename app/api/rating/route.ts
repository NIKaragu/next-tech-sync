import { Participant } from "@/types/types";
import { NextRequest } from "next/server";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return new Response("Invalid data format", { status: 400 });
    }

    if (!body.name) {
      return new Response("Missed name field", { status: 400 });
    }
    if (!body.time) {
      return new Response("Missed time field", { status: 400 });
    }

    const parsedTime =
      typeof body.time === "string" ? Number.parseFloat(body.time) : body.time;

    if (Number.isNaN(parsedTime)) {
      return new Response("Invalid time format", { status: 400 });
    }

    const formattedTime = parsedTime.toFixed(2);

    const newPlayer = {
      // id: existingRatings.length > 0 ? Math.max(...existingRatings.map(r => r.id)) + 1 : 1, // новий id
      name: body.name,
      time: formattedTime,
      rank: 0,
    };

    const ratingRes = await fetch("http://localhost:3001/rating");
    const existingRatings = await ratingRes.json();

    let playerInDb = existingRatings.find((p: Participant) => p.name === newPlayer.name);

    if (!playerInDb) {
      const createRes = await fetch("http://localhost:3001/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlayer),
      });
      if (!createRes.ok) throw new Error("Failed to create new player");
      playerInDb = await createRes.json();
    }

    const updatedRatings: Participant[] = existingRatings
      .filter((p: Participant) => p?.id !== playerInDb?.id)
      .concat({ ...playerInDb, time: newPlayer.time, rank: 0 });

    updatedRatings.sort((a, b) => Number(a.time) - Number(b.time));
    updatedRatings.forEach((entry, index) => (entry.rank = index + 1));

    const updatePromises = updatedRatings.map((player) =>
      fetch(`http://localhost:3001/rating/${player.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(player),
      })
    );
    const updateResults = await Promise.all(updatePromises);

    const failedUpdates = updateResults.filter((res) => !res.ok);
    if (failedUpdates.length > 0) {
      console.error("Some updates failed", failedUpdates);
      return new Response("Failed to update all ratings", { status: 500 });
    }

    const newRank = updatedRatings.find((p) => p.name === newPlayer.name)?.rank;

    return new Response(
      JSON.stringify({
        status: "Success",
        data: {
          newPlayer: {
            name: newPlayer.name,
            time: newPlayer.time,
            rank: newRank,
          },
          allRatings: updatedRatings,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
