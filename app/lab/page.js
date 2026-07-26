import ShaderCard from "../Components/ShaderCard";

export const metadata = {
  title: "Lab",
  description: "Explore experimental shader effects, creative coding experiments, and interactive web art by Man Navlakha.",
  alternates: {
    canonical: '/lab',
  },
};

export default function LabPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black p-8">
      <div className="w-full max-w-[450px] aspect-[3/4] rounded-[32px] overflow-hidden shadow-2xl font-sans">
        <ShaderCard />
      </div>
    </main>
  );
}
