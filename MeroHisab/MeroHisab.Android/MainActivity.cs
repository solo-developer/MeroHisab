using Android.App;
using Android.Content.PM;
using Android.Runtime;
using Android.OS;
using ImageCircle.Forms.Plugin.Droid;
using Microsoft.Extensions.DependencyInjection;
using MeroHisab.Services.Interface;
using MeroHisab.Helpers.Interface;
using MeroHisab.Droid.Services;
using AndroidX.AppCompat.App;
using FormsPinView.Droid;

namespace MeroHisab.Droid
{
    [Activity(Label = "Mero Hisab", Icon = "@mipmap/icon", Theme = "@style/MainTheme", MainLauncher = true, ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation | ConfigChanges.UiMode | ConfigChanges.ScreenLayout | ConfigChanges.SmallestScreenSize )]
    public class MainActivity : global::Xamarin.Forms.Platform.Android.FormsAppCompatActivity
    {
        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);

            Xamarin.Essentials.Platform.Init(this, savedInstanceState);
            Rg.Plugins.Popup.Popup.Init(this);
            global::Xamarin.Forms.Forms.Init(this, savedInstanceState);
            ImageCircleRenderer.Init();
            PinItemViewRenderer.Init();
            FFImageLoading.Forms.Platform.CachedImageRenderer.Init(enableFastRenderer: true);
            AppCompatDelegate.DefaultNightMode = AppCompatDelegate.ModeNightNo;
            LoadApplication(new App(AddServices));
            // Window.SetStatusBarColor(Android.Graphics.Color.Rgb(0, 153, 51));
        }
        public override void OnRequestPermissionsResult(int requestCode, string[] permissions, [GeneratedEnum] Android.Content.PM.Permission[] grantResults)
        {
            Xamarin.Essentials.Platform.OnRequestPermissionsResult(requestCode, permissions, grantResults);

            base.OnRequestPermissionsResult(requestCode, permissions, grantResults);
        }
        public override void OnBackPressed()
        {
            Rg.Plugins.Popup.Popup.SendBackPressed(base.OnBackPressed);
        }
        static void AddServices(IServiceCollection services)
        {
            services.AddTransient<IToastService, ToastService>();
            services.AddTransient<IEnvironmentService, EnvironmentService>();
        }
    }
}