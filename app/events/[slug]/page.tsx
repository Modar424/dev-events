import { notFound } from "next/navigation";
import Image from "next/image";
import Bookevent from "@/components/Bookevent"; 
import { IEvent } from "@/database/event.model";
import { getSimilarEventBySlug, getEventBySlug } from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";
import { Suspense } from "react";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

// Generate static params for all event slugs
export async function generateStaticParams() {
  try {
    await connectDB();
    const events = await Event.find({}, { slug: 1 }).lean();
    const params = events.map((event: { slug: string }) => ({
      slug: event.slug,
    }));
    return params.length > 0 ? params : [{ slug: 'placeholder' }];
  } catch (error) {
    console.error('Error generating static params:', error);
    // Return a placeholder to allow build to proceed
    return [{ slug: 'placeholder' }];
  }
}

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string; }) => (
    <div className="flex items-center gap-2">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
)

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
)

const EventTags = ({ tags }: { tags?: string[] | string; }) => {
    if (!tags) return null;
    const tagsString = Array.isArray(tags) ? tags[0] : tags;
    if (!tagsString) return null;

    const tagsArray = tagsString.replace(/[\[\],]/g, '').trim().split(/\s+/);
    
    return (
        <div className="flex flex-row gap-1.5 flex-wrap">
            {tagsArray.map((tag, index) => (
                <div className="pill" key={index}>{tag}</div>
            ))}
        </div>
    );
};

// Component for similar events
async function SimilarEvents({ slug }: { slug: string }) {
  const smiliarEvents: IEvent[] = await getSimilarEventBySlug(slug);
  
  return (
    <div className="flex w-full flex-col gap-4 pt-20">
      <h2 className="text-2xl font-bold">Similar Events</h2>
      <div>
        {smiliarEvents.length > 0 && smiliarEvents.map((smiliarEvent: IEvent) => (
          <EventCard {...smiliarEvent} key={smiliarEvent.title} /> 
        ))}
      </div>
    </div>
  );
}

// Component for event details
async function EventDetails({ slug }: { slug: string }) {
  const event = await getEventBySlug(slug);

  if (!event) {
    return notFound();
  }

  const { description, image, overview, date, time, location, mode, audience, agenda, organizer, tags } = event;
  const booking = 10;

  return (
    <>
      <div className="header">
        <h1>Event Description</h1>
        <p className="mt-2">{description}</p>
      </div>
      <div className="details">
        {/*left side -Event content*/}
        <div className="content">
          <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />
          <section className="flex-col gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>
          <section className="flex-col gap-2">
            <h2>Event Detalis</h2>
            <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
            <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
            <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
          </section>
          <EventAgenda agendaItems={agenda} />
          <section className="flex-col gap-2">
            <h2>Organizer</h2>
            <p>{organizer}</p>
          </section>
          <EventTags tags={tags} />
        </div>

        {/*Right side -Event content*/}
        <aside className="booking">
          <div className="Singup-card">
            <h2>Book Your Spot</h2>
            {booking > 0 ? (
              <p className="text-sm mt-2">{booking} people who have already booked their spot!</p>
            ) : (
              <p className="text-sm">Be the first one to book your spot!</p>
            )}
            <Bookevent />
          </div>
        </aside>
      </div>
    </>
  );
}

// Main page component
const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  return (
    <section id="event">
      <Suspense fallback={<div>Loading event details...</div>}>
        <EventDetails slug={slug} />
      </Suspense>

      <Suspense fallback={<div>Loading similar events...</div>}>
        <SimilarEvents slug={slug} />
      </Suspense>
    </section>
  );
};

export default page
