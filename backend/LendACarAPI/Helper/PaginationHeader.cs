namespace LendACarAPI.Helper
{
    public class PaginationHeader(int currentPage,int pageSize,int totalCount,int totalPages,bool hasPrevious,bool hasNext)
    {
        public int CurrentPage { get; set; } = currentPage;
        public int PageSize { get; set; }= pageSize;
        public int TotalCount { get; set; }=totalCount;
        public int TotalPages { get; set; }= totalPages;
        public bool HasPrevious { get; set; } = hasPrevious;
        public bool HasNext { get; set; }= hasNext;

    }
}
