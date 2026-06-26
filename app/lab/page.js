import ShaderCard from "../Components/ShaderCard";

export const metadata = {
  title: "Lab | Man Navlakha",
  description: "Experimental shader effects and creative coding experiments.",
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
