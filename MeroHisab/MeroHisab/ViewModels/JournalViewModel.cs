using MeroHisab.Core.Dto;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Helpers.Implementations;
using MeroHisab.Helpers.Interface;
using MeroHisab.Views;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MeroHisab.ViewModels
{
	public class JournalViewModel: ViewModelBase
	{
		public IAsyncCommand SaveButtonClickedCommand { get; set; }
		public IAsyncCommand CancelButtonClickedCommand { get; set; }

		private readonly IJournalService _journalService;
		private readonly INotificationService _notificationService;
		public Page page;
		public JournalViewModel(IJournalService journalService, INotificationService notificationService)
		{
			SaveButtonClickedCommand = new AsyncCommand(Proceed);
			CancelButtonClickedCommand = new AsyncCommand(Cancel, () => true);
			_journalService = journalService;
			_notificationService = notificationService;
		}

		private async Task Cancel()
		{
			await _navigationService.MoveBack();
			//await _navigationService.HideModal();
		}

		private async Task Proceed()
		{
			try
			{
				if (!ValidationHelper.IsFormValid(Model, page))
					return;

				_journalService.makeJournalEntries(Model);
				await _notificationService.ShowInfo("Success", "Operation performed successfully.");
				await _navigationService.HideModal();
				string key = "JournalSave";
				MessagingCenter.Send(Model, key);
			}
			catch (Exception ex)
			{
				await _notificationService.ShowInfo("Error", "Failed to perform specified operation");
			}
		}
		public JournalDto Model
		{
			get => GetValue<JournalDto>();
			set => SetValue(value);
		}
		public void SetValues(JournalDto dto)
		{
			Model = dto;
		}
	}
}
