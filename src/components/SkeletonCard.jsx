const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-card p-6 border border-border flex flex-col gap-4 animate-pulse">
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <div className="h-6 w-16 bg-gray-200 rounded-pill"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-pill"></div>
        <div className="h-6 w-14 bg-gray-200 rounded-pill"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
