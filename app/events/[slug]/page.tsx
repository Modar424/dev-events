import { notFound } from "next/navigation";
import Image from "next/image";
import Bookevent from "@/components/Bookevent";
import { IEvent } from "@/database/event.model";
import { getSimilarEventBySlug } from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
    <div className="flex items-center gap-2">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);

const EventTags = ({ tags }: { tags?: string[] | string }) => {
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

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;

    // Fetch event details
    const request = await fetch(`${BASE_URL}/api/events/${slug}`);

    if (!request.ok) return notFound();

    const { event } = await request.json();
    const { _id, description, image, overview, date, time, location, mode, audience, agenda, organizer, tags } = event;

    if (!description) return notFound();

    // ✅ جلب عدد الحجوزات الحقيقي من قاعدة البيانات
    const bookingRes = await fetch(`${BASE_URL}/api/bookings?slug=${slug}`);
    const { count: bookingCount } = await bookingRes.json();

    const similarEvents: IEvent[] = await getSimilarEventBySlug(slug);

    return (
        <section id="event">
            <div className="header">
                <h1>Event Description</h1>
                <p className="mt-2">{description}</p>
            </div>
            <div className="details">
                {/* left side */}
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
                    </section>
                    <EventAgenda agendaItems={agenda} />
                    <section className="flex-col gap-2">
                        <h2>Organizer</h2>
                        <p>{organizer}</p>
                    </section>
                    <EventTags tags={tags} />
                </div>

                {/* right side */}
                <aside className="booking">
                    <div className="Singup-card">
                        <h2>Book Your Spot</h2>

                        {/* ✅ عدد حقيقي من قاعدة البيانات */}
                        {bookingCount > 0 ? (
                            <p className="text-sm mt-2">
                                {bookingCount} {bookingCount === 1 ? 'person has' : 'people have'} already booked!
                            </p>
                        ) : (
                            <p className="text-sm">Be the first one to book your spot!</p>
                        )}

                        {/* ✅ تمرير eventId و slug للـ component */}
                        <Bookevent eventId={_id} slug={slug} />
                    </div>
                </aside>
            </div>

            <div className="flex w-full flex-col gap-4 pt-20">
                <h2 className="text-2xl font-bold">Similar Events</h2>
                <div>
                    {similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) => (
                        <EventCard {...similarEvent} key={similarEvent.title} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default page;
