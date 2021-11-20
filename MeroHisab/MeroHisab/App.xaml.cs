using MeroHisab.Helpers.Implementations;
using MeroHisab.Helpers.Interface;
using MeroHisab.Library;
using MeroHisab.Services.Interface;
using MeroHisab.ViewModels;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Xamarin.Forms;

namespace MeroHisab
{
    public partial class App : Application
    {
        protected static IServiceProvider ServiceProvider { get; set; }
        private static readonly string _servicesFolderName = "MeroHisab.Services";
        private static readonly string _mockRepoFolderName = "MeroHisab.Repository.MockRepos";
        private static readonly string _actualRepoFolderName = "MeroHisab.Repository.Implementations";

        public App(Action<IServiceCollection> addPlatformServices = null)
        {
            InitializeComponent();
            SetupServices(addPlatformServices);
            SetStatusBarColor();
            InitNavigation();
        }

        protected override void OnStart()
        {
        }

        protected override void OnSleep()
        {
        }

        protected override void OnResume()
        {
        }
        private Task InitNavigation()
        {
            var navigationService = ServiceProvider.GetService<INavigationService>();
            return navigationService.InitializeAsync();
        }

        void SetupServices(Action<IServiceCollection> addPlatformServices = null)
        {
            var services = new ServiceCollection();

            addPlatformServices?.Invoke(services);
            var assembly = typeof(ViewModelBase).Assembly;

            RegisterInterfacesAndImplementations(_servicesFolderName, services, assembly);

            #region helpers
            services.AddTransient<INotificationService, NotificationService>();
            #endregion

            RegisterRepos(services, assembly);

            RegisterViewModels(services, assembly);

            ServiceProvider = services.BuildServiceProvider();
        }

        private static void RegisterViewModels(ServiceCollection services, Assembly assembly)
        {
            var allClassesInAssembly = assembly.GetTypes().Where(a => a.IsSubclassOf(typeof(ViewModelBase))).ToList();

            foreach (var vm in allClassesInAssembly)
                services.AddTransient(vm);
        }

        private void RegisterRepos(ServiceCollection services, Assembly assembly)
        {
            // RegisterActualRepos(services, assembly);
            RegisterMockRepos(services, assembly);
        }

        private static void RegisterActualRepos(ServiceCollection services, Assembly assembly)
        {
            RegisterInterfacesAndImplementations(_actualRepoFolderName, services, assembly);
        }
        private static void RegisterMockRepos(ServiceCollection services, Assembly assembly)
        {
            RegisterInterfacesAndImplementations(_mockRepoFolderName, services, assembly);
        }

        private static void RegisterInterfacesAndImplementations(string nameSpacePart, ServiceCollection services, Assembly assembly)
        {
            var serviceTypes = assembly.GetTypes().Where(a => a.IsClass && a.FullName.Contains(nameSpacePart) && !a.IsAbstract).Select(a => new
            {
                interfaceName = a.GetInterface($"I{a.Name.Replace("Mock", string.Empty)}"),
                implementingClass = a
            }).Where(a => a.interfaceName != null).ToList();

            foreach (var serviceType in serviceTypes)
            {
                services.AddTransient(serviceType.interfaceName, serviceType.implementingClass);
            }
        }

        public static TViewModel GetViewModel<TViewModel>()
    where TViewModel : ViewModelBase
        {
            return ServiceProvider.GetService<TViewModel>();
        }
        public static T Resolve<T>() where T : class
        {
            return ServiceProvider.GetService<T>();
        }

        private void ImageButton_Clicked(object sender, EventArgs e)
        {
            try
            {
                Device.BeginInvokeOnMainThread(async () =>
                {
                    var navigation = Resolve<INavigationService>();
                    // navigate to login page
                });
            }
            catch (Exception) { }
        }

        private void SetStatusBarColor()
        {
            var environmentService = App.Resolve<IEnvironmentService>();
            if (environmentService == null)
                return;
            //if (App.Current.RequestedTheme == OSAppTheme.Dark)
            //{
            //    environmentService.SetStatusBarColor(Color.Black, false);
            //}
            //else
            //{
            environmentService.SetStatusBarColor(Constants.BackgroundColor, false);
            // }
        }
    }
}
