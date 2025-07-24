export type Participant = {
  id: string | number;
  name: string;
  time: string | number;
  rank: number;
};

export type RatingPostResponse = {
  status: string;
  data: { newPlayer: Participant, allRatings: Participant[] };
};
