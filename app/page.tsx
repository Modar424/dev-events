import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database";
import { cacheLife } from "next/cache";

const Base_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
export default async function Home() {
  'use cache';
  cacheLife('hours')
 const response = await fetch(`${Base_URL}/api/events`);
 const { events } = await response.json();
  return (
        <section className="space-y-6">
            <h1 className="text-center">{/* eslint-disable-next-line react/no-unescaped-entities */}
              The Hub for Every Dev <br /> Event You Can't Miss</h1>
            <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>
    <ExploreBtn />
    <div className="mt-20 space-y-7">
    <h3>Featured Events</h3>
      <ul className="events">
        {events&&events.length > 0 && events.map((event: IEvent ) => (
        <li key={event.title}>
          <EventCard{...event}/>
        </li>
        ))}
        </ul>
     </div>
    </section>
  );
}
 