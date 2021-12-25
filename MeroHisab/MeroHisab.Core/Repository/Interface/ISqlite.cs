using SQLite;

namespace MeroHisab.Core.Repository.Interface
{
    public interface ISqlite
    {
        SQLiteConnection GetConnection();
    }
}
