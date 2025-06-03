using System.ComponentModel.DataAnnotations;
namespace TodoApi.Models
{
    public class TodoItemCreateDto
    {
        [Required]
        public string Name { get; set; }

        public bool IsComplete { get; set; }

        public long? CategoryId { get; set; }
    }
}
