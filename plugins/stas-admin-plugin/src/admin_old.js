import './admin.scss';
import { Icon } from '@wordpress/components';
import api from '@wordpress/api';

import apiFetch from '@wordpress/api-fetch';

import {
	Button,
	Panel,
	PanelBody,
	PanelRow,
	Placeholder,
	SelectControl,
	Spinner,
	TextControl,
	ToggleControl,
	__experimentalGrid as Grid,
	__experimentalText as Text,
} from '@wordpress/components';

import DeletePostButton from './components/DeleteButton';


import {
	Fragment,
	render,
	Component,
} from '@wordpress/element';

import { __ } from '@wordpress/i18n';
import { SnackbarList } from '@wordpress/components';
import {
	select,
	dispatch,
	useDispatch,
	useSelect,
} from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

const Notices = () => {

	const notices = useSelect(
		( select ) =>
			select( noticesStore )
				.getNotices()
				.filter( ( notice ) => notice.type === 'snackbar' ),
		[]
	);
	const { removeNotice } = useDispatch( noticesStore );
	return (
		<SnackbarList
			className="edit-site-notices"
			notices={ notices }
			onRemove={ removeNotice }
		/>
	);
};

class App extends Component {
	constructor() {
		super( ...arguments );

		this.state = {
			exampleSelect: '',
			exampleText: '',
			exampleText2: '',
			exampleText3: '',
			exampleToggle: false,
			isAPILoaded: false,
			customPosts: [],
			isLoading: true,
		};
	}

	getFeaturedImageUrl(post) {
		const featuredMedia = post._embedded['wp:featuredmedia'];
		if (featuredMedia && featuredMedia.length > 0) {
			return featuredMedia[0].source_url;
		}
		return null;
	}

	componentDidMount() {

		const customPostType = 'stas_product';

		api.loadPromise.then( () => {
			this.settings = new api.models.Settings();

			const { isAPILoaded } = this.state;

			this.posts = new api.collections.Posts();

			if ( isAPILoaded === false ) {
				this.settings.fetch().then( ( response ) => {
					this.setState( {
						exampleSelect: response[ 'wholesomecode_wholesome_plugin_example_select' ],
						exampleText: response[ 'wholesomecode_wholesome_plugin_example_text' ],
						exampleText2: response[ 'wholesomecode_wholesome_plugin_example_text_2' ],
						exampleText3: response[ 'wholesomecode_wholesome_plugin_example_text_3' ],
						exampleToggle: Boolean( response[ 'wholesomecode_wholesome_plugin_example_toggle' ] ),
						isAPILoaded: true,
					} );
				} );
			}

			apiFetch({ path: `/wp/v2/${customPostType}?per_page=100&_embed` })
				.then((posts) => {
					this.setState({
						customPosts: posts,
						isLoading: false
					});
					console.log(posts)
				})
				.catch((error) => {
					console.error('Error fetching custom post type:', error);
					this.setState({ isLoading: false });
				});
		} );
	}

	render() {

		const {
			exampleSelect,
			exampleText,
			exampleText2,
			exampleText3,
			exampleToggle,
			isAPILoaded,
		} = this.state;

		const { customPosts, isLoading } = this.state;

		if (isLoading) {
			return <p>Loading...</p>;
		}

		if ( ! isAPILoaded ) {
			return (
				<Placeholder>
					<Spinner />
				</Placeholder>
			);
		}

		return (
			<Fragment>
				<div className="wholesome-plugin__header">
					<div className="wholesome-plugin__container">
						<div className="wholesome-plugin__title">
							<h1>{ __( 'Stas Admin Control Center', 'wholesome-plugin' ) } <Icon icon="admin-generic" /></h1>
						</div>
					</div>
				</div>

				<div className="wholesome-plugin__main">
					<Panel>
						<PanelBody
							title={ __( 'Panel Body One', 'wholesome-plugin' ) }
							icon="admin-plugins"
						>
							<Button variant="secondary">Add Product</Button>
							<div>
									{customPosts.map((post) => {
										const featuredImageUrl = this.getFeaturedImageUrl(post);
										return (
											<>
											{/*<li key={post.id}>
												{featuredImageUrl && (
													<img
														src={featuredImageUrl}
														alt={post.title.rendered}
														style={{ width: '100px', marginRight: '10px' }}
													/>
												)}
												<a
													href={post.link}
													target="_blank"
													rel="noopener noreferrer"
												>
													{post.title.rendered}
												</a>
											</li>*/}
											<Grid columns={ 4 } key={post.id}>
												<Text>{post.title.rendered}</Text>
												<Text>
													{featuredImageUrl && (
														<img
															src={featuredImageUrl}
															alt={post.title.rendered}
															style={{ width: '100px', marginRight: '10px' }}
														/>
													)}
												</Text>
												<Text><Button variant="primary">Edit</Button></Text>
												<Text><DeletePostButton postId={ post.id } /></Text>
											</Grid>
											</>
										);
									})}
							</div>
							<SelectControl
								help={ __( 'An example dropdown field.', 'wholesome-plugin' ) }
								label={ __( 'Example Select', 'wholesome-plugin' ) }
								onChange={ ( exampleSelect ) => this.setState( { exampleSelect } ) }
								options={ [
									{
										label: __( 'Please Select...', 'wholesome-plugin' ),
										value: '',
									},
									{
										label: __( 'Option 1', 'wholesome-plugin' ),
										value: 'option-1',
									},
									{
										label: __( 'Option 2', 'wholesome-plugin' ),
										value: 'option-2',
									},
								] }
								value={ exampleSelect }
							/>
						</PanelBody>
						<PanelBody
							title={ __( 'Panel Body Two', 'wholesome-plugin' ) }
							icon="admin-plugins"
						>
							<TextControl
								help={ __( 'This is an example text field.', 'wholesome-plugin' ) }
								label={ __( 'Example Text', 'wholesome-plugin' ) }
								onChange={ ( exampleText ) => this.setState( { exampleText } ) }
								value={ exampleText }
							/>

						</PanelBody>
						<PanelBody
							title={ __( 'Panel Body Three', 'wholesome-plugin' ) }
							icon="admin-plugins"
						>
							<PanelRow>
								<TextControl
									help={ __( 'Use PanelRow to place controls inline.', 'wholesome-plugin' ) }
									label={ __( 'Example Text 2', 'wholesome-plugin' ) }
									onChange={ ( exampleText2 ) => this.setState( { exampleText2 } ) }
									value={ exampleText2 }
								/>
								<TextControl
									help={ __( 'This control is inline.', 'wholesome-plugin' ) }
									label={ __( 'Example Text 3', 'wholesome-plugin' ) }
									onChange={ ( exampleText3 ) => this.setState( { exampleText3 } ) }
									value={ exampleText3 }
								/>
							</PanelRow>
						</PanelBody>
						<PanelBody
							title={ __( 'Panel Body Four', 'wholesome-plugin' ) }
							icon="admin-plugins"
						>
							<ToggleControl
								checked={ exampleToggle }
								help={ __( 'An example toggle.', 'wholesome-plugin' ) }
								label={ __( 'Example Toggle', 'wholesome-plugin' ) }
								onChange={ ( exampleToggle ) => this.setState( { exampleToggle } ) }
							/>
						</PanelBody>
						<Button
							isPrimary
							isLarge
							onClick={ () => {
								const {
									exampleSelect,
									exampleText,
									exampleText2,
									exampleText3,
									exampleToggle,
								} = this.state;
								const settings = new api.models.Settings( {
									[ 'wholesomecode_wholesome_plugin_example_select' ]: exampleSelect,
									[ 'wholesomecode_wholesome_plugin_example_text' ]: exampleText,
									[ 'wholesomecode_wholesome_plugin_example_text_2' ]: exampleText2,
									[ 'wholesomecode_wholesome_plugin_example_text_3' ]: exampleText3,
									[ 'wholesomecode_wholesome_plugin_example_toggle' ]: exampleToggle ? 'true' : '',
								} );
								settings.save();

								dispatch('core/notices').createNotice(
									'success',
									__( 'Settings Saved', 'wholesome-plugin' ),
									{
										type: 'snackbar',
										isDismissible: true,
									}
								);
							}}
						>
							{ __( 'Save', 'wholesome-plugin' ) }
						</Button>
					</Panel>
				</div>
				<div className="wholesome-plugin__notices">
					<Notices/>
				</div>
			</Fragment>
		)
	}
}

document.addEventListener( 'DOMContentLoaded', () => {
	const htmlOutput = document.getElementById( 'wholesome-plugin-settings' );

	if ( htmlOutput ) {
		render(
			<App />,
			htmlOutput
		);
	}
});
