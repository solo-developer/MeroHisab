using Android.App;
using Android.Widget;
using MeroHisab.Droid.Services;
using MeroHisab.Services.Interface;

[assembly: Xamarin.Forms.Dependency(typeof(ToastService))]
namespace MeroHisab.Droid.Services
{
    public class ToastService : IToastService
    {
        public void LongAlert(string message)
        {
            Toast.MakeText(Application.Context, message, ToastLength.Long).Show();
        }

        public void ShortAlert(string message)
        {
            Toast.MakeText(Application.Context, message, ToastLength.Short).Show();
        }
    }
}