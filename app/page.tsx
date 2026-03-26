import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database";
import { getAllEvents } from "@/lib/actions/event.actions";
import { Suspense } from "react";

// Component for featured events
async function FeaturedEvents() {
  const events = await getAllEvents();
  
  return (
    <div className="mt-20 space-y-7">
      <h3>Featured Events</h3>
      <ul className="events">
        {events && events.length > 0 && events.map((event: IEvent) => (
          <li key={event.title}>
            <EventCard {...event} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function Home() {
  return (
    <section className="space-y-6">
      <h1 className="text-center">
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        The Hub for Every Dev <br /> Event You Can't Miss
      </h1>
      <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>
      <ExploreBtn />
      
      <Suspense fallback={<div>Loading featured events...</div>}>
        <FeaturedEvents />
      </Suspense>
    </section>
  );
}
 