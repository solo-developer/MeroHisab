using Android.OS;
using MeroHisab.Droid.Services;
using MeroHisab.Helpers.Interface;
using System.Drawing;
using Xamarin.Essentials;

[assembly: Xamarin.Forms.Dependency(typeof(EnvironmentService))]
namespace MeroHisab.Droid.Services
{
    public class EnvironmentService : IEnvironmentService
    {
        public void SetStatusBarColor(Color color, bool darkStatusBarTint)
        {
            if (Build.VERSION.SdkInt < Android.OS.BuildVersionCodes.Lollipop)
                return;
            var activity = Platform.CurrentActivity;
            var window = activity.Window;
            window.AddFlags(Android.Views.WindowManagerFlags.DrawsSystemBarBackgrounds);
            window.ClearFlags(Android.Views.WindowManagerFlags.TranslucentStatus);
            window.SetStatusBarColor(color.ToPlatformColor());

            if (Build.VERSION.SdkInt >= Android.OS.BuildVersionCodes.M)
            {
                var flag = (Android.Views.StatusBarVisibility)Android.Views.SystemUiFlags.LightStatusBar;
                window.DecorView.SystemUiVisibility = darkStatusBarTint ? flag : 0;
            }
        }
    }
}