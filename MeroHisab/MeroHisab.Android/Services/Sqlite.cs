using MeroHisab.Droid.Services;
using MeroHisab.Core.Repository.Interface;
using SQLite;
using System.IO;
using Xamarin.Forms;

[assembly: Dependency(typeof(Sqlite))]
namespace MeroHisab.Droid.Services
{
    public class Sqlite : ISqlite
    {
        public SQLiteConnection GetConnection()
        {
            var dbase = "MeroHisab";
            var dbpath = System.Environment.GetFolderPath(System.Environment.SpecialFolder.LocalApplicationData);
            var path = Path.Combine(dbpath, dbase);
            var connection = new SQLiteConnection(path);
            return connection;
        }
    }
}