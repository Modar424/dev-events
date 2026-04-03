import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database";
import { getAllEvents } from "@/lib/actions/event.actions";

export default async function Home() {
  const events = await getAllEvents();
  return (
        <section className="space-y-6">
            <h1 className="text-center">
              The Hub for Every Dev <br /> Event You Can&apos;t Miss</h1>
            <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>
    <ExploreBtn />
    <div className="mt-20 space-y-7">
    <h3>Featured Events</h3>
      <ul className="events" id="events">
        {events && events.length > 0 && events.map((event: IEvent) => (
        <li key={event.title}>
          <EventCard{...event}/>
        </li>
        ))}
        </ul>
     </div>
    </section>
  );
}
