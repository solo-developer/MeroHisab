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
        public SQLiteAsyncConnection GetConnection()
        {
            var dbase = "MeroHisabDb.db3";
            var dbpath = System.Environment.GetFolderPath(System.Environment.SpecialFolder.LocalApplicationData);
            var path = Path.Combine(dbpath, dbase);
            var connection = new SQLiteAsyncConnection(path,true);
            return connection;
        }
    }
}