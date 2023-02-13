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
using MeroHisab.Core.Repository.Interface;
using Android.Views;
using System.Linq;
using MeroHisab.CustomControls;

namespace MeroHisab.Droid
{
    [Activity(Label = "Mero Hisab", Icon = "@mipmap/ic_launcher", Theme = "@style/MainTheme", MainLauncher = true, ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation | ConfigChanges.UiMode | ConfigChanges.ScreenLayout | ConfigChanges.SmallestScreenSize )]
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
           XF.Material.Droid.Material.Init(this, savedInstanceState);
            LoadApplication(new App(AddServices));
            // Window.SetStatusBarColor(Android.Graphics.Color.Rgb(0, 153, 51));
        }
        public override void OnRequestPermissionsResult(int requestCode, string[] permissions, [GeneratedEnum] Android.Content.PM.Permission[] grantResults)
        {
            Xamarin.Essentials.Platform.OnRequestPermissionsResult(requestCode, permissions, grantResults);

            base.OnRequestPermissionsResult(requestCode, permissions, grantResults);
        }
        public override bool OnOptionsItemSelected(IMenuItem item)
        {
            // check if the current item id 
            // is equals to the back button id
            if (item.ItemId == 16908332)
            {
                // retrieve the current xamarin forms page instance
                var currentpage = (BackButtonEventOverrideableContentPage)
                Xamarin.Forms.Application.
                Current.MainPage.Navigation.
                NavigationStack.LastOrDefault();

                // check if the page has subscribed to 
                // the custom back button event
                if (currentpage?.CustomBackButtonAction != null)
                {
                    // invoke the Custom back button action
                    currentpage?.CustomBackButtonAction.Invoke();
                    // and disable the default back button action
                    return false;
                }

                // if its not subscribed then go ahead 
                // with the default back button action
                return base.OnOptionsItemSelected(item);
            }
            else
            {
                // since its not the back button 
                //click, pass the event to the base
                return base.OnOptionsItemSelected(item);
            }
        }

        public override void OnBackPressed()
        {
            // retrieve the current xamarin forms page instance
            var currentpage = (BackButtonEventOverrideableContentPage)
            Xamarin.Forms.Application.
            Current.MainPage.Navigation.
            NavigationStack.LastOrDefault();

            // check if the page has subscribed to 
            // the custom back button event
            if (currentpage?.CustomBackButtonAction != null)
            {
                currentpage?.CustomBackButtonAction.Invoke();
            }
            else
            {
                base.OnBackPressed();
            }
            Rg.Plugins.Popup.Popup.SendBackPressed(base.OnBackPressed);
        }
       
        static void AddServices(IServiceCollection services)
        {
            services.AddTransient<IToastService, ToastService>();
            services.AddTransient<IEnvironmentService, EnvironmentService>();
            services.AddScoped<ISqlite, Sqlite>();
        }
    }
}