using MeroHisab.Core.Services.Interface;
using MeroHisab.Helpers.Interface;
using System;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;

namespace MeroHisab.ViewModels
{
    public class ReportByAccountHeadPageModel : ViewModelBase
    {
        public IAsyncCommand FilterReportButtonClicked { get; set; }

        private readonly IReportService _reportService;
        private readonly INotificationService _notificationService;

        public ReportByAccountHeadPageModel(IReportService reportService,INotificationService notificationService)
        {
            _reportService=reportService;
            _notificationService=notificationService;

            FilterReportButtonClicked = new AsyncCommand(ShowFilterModel);
        }

        private async Task ShowFilterModel()
        {
            await _notificationService.ShowInfo("I am not dumb", "Your click is being heard of");
        }
    }
}
