using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TodoApi.Models
{
    public class TodoItem
    {
        public long Id { get; set; }

        [Required]
        public string Name { get; set; }
        public bool IsComplete { get; set; }

        public long? CategoryId { get; set; }
        public ItemCategory? Category { get; set; }

      
        public string UserId { get; set; }

        //[JsonIgnore]
        //public ApplicationUser User { get; set; }
    }
}