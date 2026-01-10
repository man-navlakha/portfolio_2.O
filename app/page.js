import HomeClient from './HomeClient';

export const metadata = {
  title: {
    absolute: "Man Navlakha | Full Stack Developer & Designer"
  },
  description: "Crafting purpose-driven digital experiences that inspire & engage. Portfolio of Man Navlakha, a frontend developer focused on responsive and user-friendly interfaces.",
  openGraph: {
    title: "Man Navlakha | Full Stack Developer & Designer",
    description: "Crafting purpose-driven experiences that inspire & engage.",
    images: ["/og-image.png"],
  },
};

export default function Home() {
  return <HomeClient />;
}
