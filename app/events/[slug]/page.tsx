import { notFound } from "next/navigation";
import Image from "next/image";
import Bookevent from "@/components/Bookevent";
import { IEvent } from "@/database/event.model";
import { getSimilarEventBySlug, getEventBySlug, getBookingCount } from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";

export const dynamic = 'force-dynamic';

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
    <div className="event-detail-item">
        <Image src={icon} alt={alt} width={17} height={17} className="event-detail-icon" />
        <p>{label}</p>
    </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => {
    // Normalize: handle stringified arrays like '["item1","item2"]'
    const normalizeAgenda = (items: string[]): string[] => {
        if (items.length === 1) {
            const single = items[0];
            if (single.startsWith('[') && single.endsWith(']')) {
                try {
                    const parsed = JSON.parse(single);
                    if (Array.isArray(parsed)) return parsed.map(String);
                } catch {
                    // fallback: strip brackets and split by comma
                    return single.replace(/^\[|\]$/g, '').split(',').map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean);
                }
            }
        }
        return items;
    };

    const items = normalizeAgenda(agendaItems);

    return (
        <div className="agenda-section">
            <h2>Agenda</h2>
            <div className="agenda-timeline">
                {items.map((item, index) => (
                    <div key={index} className="agenda-timeline-item">
                        <div className="agenda-timeline-left">
                            <div className="agenda-dot">{index + 1}</div>
                            {index < items.length - 1 && <div className="agenda-line" />}
                        </div>
                        <div className="agenda-card">
                            <p>{item}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EventTags = ({ tags }: { tags?: string[] | string }) => {
    if (!tags) return null;
    let tagsArray: string[] = [];
    if (Array.isArray(tags)) {
        // Handle ["tag1,tag2,tag3"] or ["tag1","tag2"]
        if (tags.length === 1 && tags[0].includes(',')) {
            tagsArray = tags[0].split(',').map(t => t.trim()).filter(Boolean);
        } else {
            tagsArray = tags.map(t => t.trim()).filter(Boolean);
        }
    } else {
        tagsArray = String(tags).split(',').map(t => t.trim()).filter(Boolean);
    }
    if (!tagsArray.length) return null;
    return (
        <div className="flex flex-row gap-1.5 flex-wrap">
            {tagsArray.map((tag, index) => (
                <div className="pill" key={index}>{tag}</div>
            ))}
        </div>
    );
};

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const event = await getEventBySlug(slug);
    if (!event) return notFound();

    const { description, image, overview, date, time, location, mode, audience, agenda, organizer, tags, capacity } = event;
    const _id = event._id.toString();
    if (!description) return notFound();

    const bookingCount = await getBookingCount(slug);
    const availableSeats = capacity ? capacity - bookingCount : 0;
    const similarEvents: IEvent[] = await getSimilarEventBySlug(slug);

    return (
        <section id="event">
            <div className="header">
                <h1>Event Description</h1>
                <p className="mt-2">{description}</p>
            </div>
            <div className="details">
                <div className="content">
                    <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />
                    <section className="flex-col gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>
                    <section className="flex-col gap-2">
                        <h2>Event Details</h2>
                        <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                        <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
                        <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
                        <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
                        <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
                        {capacity && <EventDetailItem icon="/icons/audience.svg" alt="capacity" label={`${availableSeats}/${capacity} seats available`} />}
                    </section>
                    {agenda && agenda.length > 0 && <EventAgenda agendaItems={agenda} />}
                    <section className="flex-col gap-2">
                        <h2>Organizer</h2>
                        <p>{organizer}</p>
                    </section>
                    <EventTags tags={tags} />
                </div>

                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Your Spot</h2>
                        {capacity && availableSeats <= 0 ? (
                            <p className="text-sm mt-2 text-red-500 font-semibold">
                                Event is fully booked
                            </p>
                        ) : bookingCount > 0 ? (
                            <p className="text-sm mt-2">
                                {bookingCount} {bookingCount === 1 ? 'person has' : 'people have'} already booked!
                                {capacity && <span className="block mt-1">{availableSeats} seats remaining</span>}
                            </p>
                        ) : (
                            <p className="text-sm">Be the first one to book your spot!</p>
                        )}
                        <Bookevent eventId={_id} slug={slug} />
                    </div>
                </aside>
            </div>

            {similarEvents.length > 0 && (
                <div className="flex w-full flex-col gap-4 pt-20">
                    <h2 className="text-2xl font-bold">Similar Events</h2>
                    <div className="events">
                        {similarEvents.map((similarEvent: IEvent) => (
                            <EventCard {...similarEvent} key={similarEvent.title} />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default page;
