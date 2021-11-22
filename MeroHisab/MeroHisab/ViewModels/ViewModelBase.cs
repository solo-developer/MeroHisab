using MeroHisab.Services.Interface;
using Plugin.Connectivity;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;

namespace MeroHisab.ViewModels
{
    public abstract class ViewModelBase : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler PropertyChanged;
        private Dictionary<string, object> properties = new Dictionary<string, object>();
        protected readonly INavigationService _navigationService;
        protected readonly IToastService _toastService;

        public ViewModelBase()
        {
            _navigationService = App.Resolve<INavigationService>();
            _toastService = App.Resolve<IToastService>();

            CrossConnectivity.Current.ConnectivityChanged += Current_ConnectivityChanged;
        }
        ~ViewModelBase()
        {
            CrossConnectivity.Current.ConnectivityChanged -= Current_ConnectivityChanged;
        }


        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            var handler = PropertyChanged;
            if (handler != null)
                handler(this, new PropertyChangedEventArgs(propertyName));
        }

        protected void SetValue<T>(T value, [CallerMemberName] string propertyName = null)
        {
            if (!properties.ContainsKey(propertyName))
            {
                properties.Add(propertyName, default(T));
            }

            var oldValue = GetValue<T>(propertyName);
            if (!EqualityComparer<T>.Default.Equals(oldValue, value))
            {
                properties[propertyName] = value;
                OnPropertyChanged(propertyName);
            }
        }

        protected T GetValue<T>([CallerMemberName] string propertyName = null)
        {
            if (!properties.ContainsKey(propertyName))
            {
                return default(T);
            }
            else
            {
                return (T)properties[propertyName];
            }
        }

        private void Current_ConnectivityChanged(object sender, Plugin.Connectivity.Abstractions.ConnectivityChangedEventArgs e)
        {
            bool isConnected = e.IsConnected;
            if (isConnected)
            {
                _toastService.ShortAlert("You are online.");
                return;
            }
            _toastService.ShortAlert("You are offline.");
        }
        public virtual Task InitializeAsync(object navigationData)
        {
            return Task.FromResult(false);
        }
    }
}
