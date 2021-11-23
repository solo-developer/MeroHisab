using SQLite;

namespace MeroHisab.Core.Entities
{
    public class BaseEntity
    {
        [PrimaryKey, AutoIncrement]
        public int Id { get; set; }
    }
}
