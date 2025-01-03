import logo from "../assets/pdes.png";

function Loading({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <img src={logo} alt="Loading" className="animate-zoomInOut w-56 h-56" />
    </div>
  );
}

export default Loading;
