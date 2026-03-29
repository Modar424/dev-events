import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <header>
      <nav>
        <Link href="/" className="logo">
          <Image 
            src="/icons/logo.png" 
            alt="logo" 
            width={24} 
            height={24} 
          />
          <span>DevEvent</span>
        </Link>

        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/events/create">Create Event</Link></li>
          <li><Link href="/admin">Admin</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;