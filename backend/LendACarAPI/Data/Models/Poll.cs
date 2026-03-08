using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace LendACarAPI.Data.Models
{

    public class Poll
    {
        public int Id { get; set; }
        public string Question { get; set; }
        public List<string> Options { get; set; }
        public Dictionary<string, int> Votes { get; set; } = new();
        public bool IsClosed { get; set; } = false;
        public List<int> VotedUserIds { get; set; } = new();
    }

}
