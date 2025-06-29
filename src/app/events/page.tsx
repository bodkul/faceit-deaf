import { Metadata } from "next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Events",
};

const MATCH_IDS = [
  // BEST OF 1
  "1-25aad9ce-6625-4870-ae8b-5e17764d7178",
  "1-3603bade-ad9a-437f-a599-177f29e32a47",
  "1-57fcc73f-ad2b-4fe3-bc09-8f00c646c772",
  "1-fad52abb-58e8-46f5-9456-3987b66bfe37",
  "1-e9545bb6-10c8-4de5-b574-9b831a6846d3",
  "1-01b87a0c-820e-41b4-982b-6d9b0f680952",
  "1-4786efa1-56c9-4285-aefb-2e2172bc3ff3",
  "1-6b0259e1-15a8-491d-9e2e-1b4424ec3150",
  "1-386c7260-0623-476c-aedf-df24d704a366",
  "1-3139fca2-6ec5-43da-842f-10cef60b0b72",
  "1-009898c1-4a6b-4382-9bca-a6149b5f5571",
  "1-4fb2a664-b926-48be-9f94-7c08d89815fc",
  "1-de36baa2-ab87-449e-b9b9-a4effbd7d92b",
  "1-f0692443-04dc-43a2-9a75-45357f6c12c0",
  "1-bf9eda10-47d7-40a0-b0b3-c958e2bf6e1c",
  "1-ff2cc264-fba7-4b3c-9d5d-f3ee3cfe2d32",
  "1-fca189cb-b142-426c-aea0-c66317d933bc",
  "1-f7e33ee0-d1fe-4932-a92c-0267c8839b9a",
  "1-28afec17-91f1-473d-806e-a3fa7bf92682",

  // BEST OF 3
  "1-73a68568-69a9-44cd-b23c-abc96cb1c943",
  "1-5e0fde76-9706-4300-997c-3b615be88cb1",
];

const events = [
  {
    id: "1-25aad9ce-6625-4870-ae8b-5e17764d7178",
    name: "ESDUA Season 2",
    avatar:
      "https://distribution.faceit-cdn.net/images/f24144b4-3698-4550-96a0-d476559c2c81.jpeg",
    location: "Europe (Online)",
    teams: 10,
    date: ["2025-06-21", "2025-06-22"],
  },
];

export default async function EsduaPage() {
  // const matches = await fetchMatches(MATCH_IDS);

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {metadata.title?.toString()}
        </h1>
      </div>
      <div className="flex flex-col gap-4">
        {events.map((event) => (
          <Card key={event.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={event.avatar} alt="Image" />
                  <AvatarFallback>{event.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm leading-none font-medium">
                    {event.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {event.location}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm leading-none font-medium">10</p>
                <p className="text-sm text-muted-foreground">Teams</p>
              </div>
              <div>
                <p className="text-sm leading-none font-medium">Online</p>
              </div>
              {/* <Select defaultValue="edit">
                    <SelectTrigger
                      className="ml-auto pr-2"
                      aria-label="Edit"
                      size="sm"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="edit">Can edit</SelectItem>
                      <SelectItem value="view">Can view</SelectItem>
                    </SelectContent>
                  </Select> */}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
