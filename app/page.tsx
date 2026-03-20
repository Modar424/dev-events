import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import {events} from "@/lib/constants"
export default function Home() {
  return (
        <section className="space-y-6">
            <h1 className="text-center">{/* eslint-disable-next-line react/no-unescaped-entities */}
              The Hub for Every Dev <br /> Event You Can't Miss</h1>
            <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>
    <ExploreBtn />
    <div className="mt-20 space-y-7">
    <h3>Featured Events</h3>
      <ul className="events">
        {events.map((event) => (
        <li key={event.title}>
          <EventCard{...event}/>
        </li>
        ))}
        </ul>
     </div>
    </section>
  );
}
 