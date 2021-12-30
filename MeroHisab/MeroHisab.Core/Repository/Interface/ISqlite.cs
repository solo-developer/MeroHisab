using SQLite;

namespace MeroHisab.Core.Repository.Interface
{
    public interface ISqlite
    {
        SQLiteAsyncConnection GetConnection();
    }
}
