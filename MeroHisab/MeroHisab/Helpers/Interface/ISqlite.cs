using SQLite;

namespace MeroHisab.Helpers.Interface
{
    public interface ISqlite
    {
        SQLiteConnection GetConnection();
    }
}
