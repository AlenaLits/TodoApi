using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Models;

namespace TodoApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemCategoriesController : ControllerBase
    {
        private readonly TodoContext _context;

        public ItemCategoriesController(TodoContext context)
        {
            _context = context;
        }

        // GET: api/ItemCategories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ItemCategory>>> GetCategories()
        {
            return await _context.ItemCategories.ToListAsync();
        }

        // POST: api/ItemCategories
        [HttpPost]
        public async Task<ActionResult<ItemCategory>> PostCategory(ItemCategory category)
        {
            _context.ItemCategories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
        }
    }
}
