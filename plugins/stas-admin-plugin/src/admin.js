import {Component, render} from '@wordpress/element';
import CustomPostList from './custom-post-list';
import CustomPostEditor from './custom-post-editor';
import CustomPostUpdate from './custom-post-update';
import './admin.scss';


class App extends Component {
	state = {
		view: 'list',
		selectedPostId: null,
	};

	showList = () => {
		this.setState({ view: 'list', selectedPostId: null });
	};

	showEditor = (postId) => {
		this.setState({ view: 'editor', selectedPostId: postId });
	};

	render() {
		const { view, selectedPostId } = this.state;

		if (view === 'list') {
			return <CustomPostList onAddNew={() => this.showEditor(null)} onEdit={this.showEditor}  className={"stas-plugin__main"} />;
		} else if (view === 'editor') {
			if (selectedPostId) {
				return <CustomPostUpdate postId={selectedPostId} onBack={this.showList} />;
			} else {
				return <CustomPostEditor onPostCreated={this.showEditor} onCancel={this.showList} />;
			}
		}
	}
}

document.addEventListener( 'DOMContentLoaded', () => {
	const htmlOutput = document.getElementById( 'root_id' );

	if ( htmlOutput ) {
		render(
			<App />,
			htmlOutput
		);
	}
});
